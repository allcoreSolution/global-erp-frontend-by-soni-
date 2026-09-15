import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Clock, CalendarDays, ClipboardCheck, Settings, Users, Moon, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddShiftSetup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Basic Info
    shiftCode: 'SHT-001',
    shiftName: '',
    shiftType: 'Fixed',
    company: '',
    branch: '',
    department: '',
    status: 'Active',

    // Shift Timing
    startTime: '09:00',
    endTime: '18:00',
    workingHours: '08:30',
    graceTime: '15',
    lateMarkAfter: '15',
    earlyLeaving: 'No',
    overtime: 'Yes',
    otAfter: '30',

    // Break Config
    breakApplicable: 'Yes',
    breakType: 'Fixed',
    breakDuration: '30',
    paidBreak: 'Yes',
    
    // Working Days
    workDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
    weeklyOff: 'Sunday',

    // Attendance Rules
    attendanceRequired: 'Yes',
    lateComing: 'Allowed',
    halfDayAfter: '4',
    minimumHours: '8',
    attendanceMethod: 'Biometric',
    autoCheckout: 'No',

    // Shift Assignment
    assignTo: 'Department',
    employee: '',
    effectiveFrom: '',
    effectiveTo: '',
    defaultShift: 'No',

    // Night Shift
    nightShift: 'No',
    crossMidnight: 'No',
    nextDayCheckout: 'Auto'
  });

  const [breaks, setBreaks] = useState([
    { id: 1, name: 'Lunch', start: '13:00', end: '13:30', duration: '30m', paid: 'Yes' }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('day_')) {
      const day = name.split('_')[1];
      setForm(prev => ({
        ...prev,
        workDays: { ...prev.workDays, [day]: checked }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleAddBreak = () => {
    setBreaks([...breaks, { id: Date.now(), name: '', start: '', end: '', duration: '', paid: 'No' }]);
  };

  const handleBreakChange = (id, field, value) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleRemoveBreak = (id) => {
    setBreaks(breaks.filter(b => b.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Shift Created Successfully!');
    navigate('/hrms/setup/shifts');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/setup/shifts')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Shift List
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">
            <Plus size={16} /> Add Shift & Timing
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
                  <Settings size={14} className="text-indigo-500" /> Basic Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Shift Code *</label>
                  <input type="text" value={form.shiftCode} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Shift Name *</label>
                  <input type="text" name="shiftName" value={form.shiftName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. General Shift" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Shift Type *</label>
                  <select name="shiftType" value={form.shiftType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Fixed</option>
                    <option>Flexible</option>
                    <option>Rotating</option>
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
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                  <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    <option>IT & Systems</option>
                    <option>HR</option>
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

            {/* 4. WORKING DAYS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays size={14} className="text-blue-500" /> Working Days
                </h3>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-4 mb-4">
                  {Object.keys(form.workDays).map(day => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name={`day_${day}`}
                        checked={form.workDays[day]} 
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">{day}</span>
                    </label>
                  ))}
                </div>
                <div className="w-1/2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Weekly Off</label>
                  <select name="weeklyOff" value={form.weeklyOff} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Sunday</option>
                    <option>Saturday & Sunday</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. ATTENDANCE RULES */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <ClipboardCheck size={14} className="text-emerald-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Attendance Rules</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Attendance Required</label>
                  <select name="attendanceRequired" value={form.attendanceRequired} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Late Coming</label>
                  <select name="lateComing" value={form.lateComing} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Allowed</option>
                    <option>Not Allowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Half Day After</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="halfDayAfter" value={form.halfDayAfter} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                    <span className="text-sm font-medium text-slate-500">Hours</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Minimum Hours</label>
                  <div className="flex items-center gap-2">
                    <input type="number" name="minimumHours" value={form.minimumHours} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                    <span className="text-sm font-medium text-slate-500">Hours</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Attendance Method</label>
                  <select name="attendanceMethod" value={form.attendanceMethod} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Biometric</option>
                    <option>Web Check-in</option>
                    <option>Mobile App</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Auto Checkout</label>
                  <select name="autoCheckout" value={form.autoCheckout} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. SHIFT TIMING */}
            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white border border-slate-700">
              <div className="bg-slate-900 border-b border-slate-700 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-emerald-400" /> Shift Timing
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Time *</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Time *</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Working Hours (Auto)</label>
                  <input type="text" value={`${form.workingHours} Hrs`} disabled className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-emerald-400 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Grace Time</label>
                    <div className="flex items-center gap-2">
                      <input type="number" name="graceTime" value={form.graceTime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                      <span className="text-xs text-slate-400">Min</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Late Mark After</label>
                    <div className="flex items-center gap-2">
                      <input type="number" name="lateMarkAfter" value={form.lateMarkAfter} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                      <span className="text-xs text-slate-400">Min</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Early Leaving</label>
                    <select name="earlyLeaving" value={form.earlyLeaving} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Overtime</label>
                    <select name="overtime" value={form.overtime} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
                {form.overtime === 'Yes' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">OT After (Min)</label>
                    <input type="number" name="otAfter" value={form.otAfter} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                  </div>
                )}
              </div>
            </div>

            {/* 3. BREAK CONFIGURATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-amber-500" /> Break Configuration
                </h3>
              </div>
              <div className="p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Break Applicable</label>
                    <select name="breakApplicable" value={form.breakApplicable} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Break Type</label>
                    <select name="breakType" value={form.breakType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none">
                      <option>Fixed</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                </div>
                
                {form.breakApplicable === 'Yes' && (
                  <div className="border rounded-xl overflow-hidden mt-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b text-slate-600 uppercase">
                        <tr>
                          <th className="px-3 py-2 font-bold">Name</th>
                          <th className="px-3 py-2 font-bold">Start/End</th>
                          <th className="px-3 py-2 font-bold">Paid</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {breaks.map(b => (
                          <tr key={b.id}>
                            <td className="px-3 py-2">
                              <input type="text" value={b.name} onChange={(e) => handleBreakChange(b.id, 'name', e.target.value)} placeholder="e.g. Lunch" className="w-full p-1 border rounded" />
                            </td>
                            <td className="px-3 py-2 space-y-1">
                              <input type="time" value={b.start} onChange={(e) => handleBreakChange(b.id, 'start', e.target.value)} className="w-full p-1 border rounded text-[10px]" />
                              <input type="time" value={b.end} onChange={(e) => handleBreakChange(b.id, 'end', e.target.value)} className="w-full p-1 border rounded text-[10px]" />
                            </td>
                            <td className="px-3 py-2">
                              <select value={b.paid} onChange={(e) => handleBreakChange(b.id, 'paid', e.target.value)} className="w-full p-1 border rounded text-[10px]">
                                <option>Yes</option>
                                <option>No</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => handleRemoveBreak(b.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-2 bg-slate-50 border-t">
                      <button type="button" onClick={handleAddBreak} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
                        <Plus size={14} /> Add Break
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 6. SHIFT ASSIGNMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-purple-500" /> Shift Assignment
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assign To</label>
                  <select name="assignTo" value={form.assignTo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Department</option>
                    <option>Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee / Dept</label>
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Target...</option>
                    <option>All Staff</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Effective From *</label>
                    <input type="date" name="effectiveFrom" value={form.effectiveFrom} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Effective To</label>
                    <input type="date" name="effectiveTo" value={form.effectiveTo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Default Shift</label>
                  <select name="defaultShift" value={form.defaultShift} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. NIGHT SHIFT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Moon size={14} className="text-slate-700" /> Night Shift
                </h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Night Shift</label>
                  <select name="nightShift" value={form.nightShift} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Cross Midnight</label>
                  <select name="crossMidnight" value={form.crossMidnight} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Next Day Checkout</label>
                  <select name="nextDayCheckout" value={form.nextDayCheckout} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Auto</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/hrms/setup/shifts')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> Create Shift
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddShiftSetup;
