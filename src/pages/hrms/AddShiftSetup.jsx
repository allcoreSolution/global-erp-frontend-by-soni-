import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Clock, CalendarDays, ClipboardCheck, Settings, Moon, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const AddShiftSetup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    // Basic Info
    shiftCode: `SHT-${Math.floor(Math.random() * 9000) + 1000}`,
    shiftName: '',
    shiftType: 'Fixed',
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

    // Working Days
    workDays: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
    weeklyOff: 'Sunday',

    // Attendance Rules (simplified)
    halfDayAfter: '4',
    minimumHours: '8',

    // Assignment & General
    effectiveFrom: '',
    defaultShift: 'No',

    // Night Shift
    nightShift: 'No',
  });

  const [breaks, setBreaks] = useState([
    { id: 1, name: 'Lunch', start: '13:00', end: '13:30', duration: '30m', paid: 'Yes' }
  ]);

  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);

  // Fetch departments and branches from backend
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, branchRes] = await Promise.all([
          api.get('/departments'),
          api.get('/branches').catch(() => ({ data: { data: [] } }))
        ]);
        if (deptRes.data?.data) setDepartments(deptRes.data.data.map(d => d.deptName));
        if (branchRes.data?.data) setBranches(branchRes.data.data.map(b => b.branchName || b.name));
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    };
    fetchDropdowns();
  }, []);

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

  // Auto-calculate working hours when start/end time changes
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(':').map(Number);
      const [eh, em] = form.endTime.split(':').map(Number);
      let totalMins = (eh * 60 + em) - (sh * 60 + sm);
      if (totalMins < 0) totalMins += 24 * 60; // overnight shift
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      setForm(prev => ({ ...prev, workingHours: `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}` }));
    }
  }, [form.startTime, form.endTime]);

  const handleAddBreak = () => {
    setBreaks([...breaks, { id: Date.now(), name: '', start: '', end: '', duration: '', paid: 'No' }]);
  };

  const handleBreakChange = (id, field, value) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleRemoveBreak = (id) => {
    setBreaks(breaks.filter(b => b.id !== id));
  };

  useEffect(() => {
    if (isEditMode) {
      fetchShiftDetails();
    }
  }, [id]);

  const fetchShiftDetails = async () => {
    try {
      const response = await api.get(`/shift-setups/${id}`);
      const s = response.data.data || response.data;
      if (s) {
        setForm({
          shiftCode: s.shiftCode || '',
          shiftName: s.shiftName || '',
          shiftType: s.shiftType || 'Fixed',
          branch: s.branch || '',
          department: s.department || '',
          status: s.status || 'Active',
          startTime: s.startTime || '09:00',
          endTime: s.endTime || '18:00',
          workingHours: s.workingHours || '08:30',
          graceTime: s.graceTime || '15',
          lateMarkAfter: s.lateMarkAfter || '15',
          earlyLeaving: s.earlyLeaving || 'No',
          overtime: s.overtime || 'Yes',
          otAfter: s.otAfter || '30',
          breakApplicable: s.breakApplicable || 'Yes',
          breakType: s.breakType || 'Fixed',
          workDays: s.workDays || { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
          weeklyOff: s.weeklyOff || 'Sunday',
          halfDayAfter: s.halfDayAfter || '4',
          minimumHours: s.minimumHours || '8',
          effectiveFrom: s.effectiveFrom || '',
          defaultShift: s.defaultShift || 'No',
          nightShift: s.nightShift || 'No',
        });
        if (s.breaks && s.breaks.length > 0) {
          setBreaks(s.breaks.map(b => ({ ...b, id: b._id || Date.now() + Math.random() })));
        }
      }
    } catch (error) {
      console.error('Error fetching shift details:', error);
      alert('Error fetching shift details');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, breaks };
      if (isEditMode) {
        await api.put(`/shift-setups/${id}`, payload);
        alert('Shift Updated Successfully!');
      } else {
        await api.post('/shift-setups', payload);
        alert('Shift Created Successfully!');
      }
      navigate('/hrms/setup/shifts');
    } catch (error) {
      console.error('Error saving shift:', error);
      alert(error.response?.data?.message || 'Error saving shift details');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/60 to-indigo-50/30 p-4 sm:p-6 lg:p-8 font-sans text-slate-800 pb-24">
      {/* Top Navigation / Breadcrumb Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-4 sm:px-6 sm:py-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/hrms/setup/shifts')}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all border border-slate-200/70 shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  HRMS &bull; Shift Setup
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${form.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {form.status}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {isEditMode ? 'Edit Shift Configuration' : 'Create New Shift'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => navigate('/hrms/setup/shifts')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100/80 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Save size={14} /> {isEditMode ? 'Update Shift' : 'Save Shift'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN - Primary Details */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-indigo-50/20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                    <Settings size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Basic Information</h2>
                    <p className="text-[11px] text-slate-400">Shift identity and department assignment</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                  {form.shiftCode}
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Shift Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shiftName"
                    value={form.shiftName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Regular Day Shift"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none text-slate-800 placeholder-slate-400 font-medium bg-slate-50/30 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Shift Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shiftCode"
                    value={form.shiftCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Shift Type
                  </label>
                  <select
                    name="shiftType"
                    value={form.shiftType}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white font-medium"
                  >
                    <option value="Fixed">Fixed Schedule</option>
                    <option value="Flexible">Flexible Schedule</option>
                    <option value="Rotating">Rotating Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white"
                  >
                    <option value="">All Branches</option>
                    {branches.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                    Department
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white"
                  >
                    <option value="">All Departments</option>
                    {departments.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Working Days & Weekly Off */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Working Schedule</h2>
                    <p className="text-[11px] text-slate-400">Select active days and default weekend rest</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2.5">
                    Active Working Days
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {Object.keys(form.workDays).map(day => {
                      const isActive = form.workDays[day];
                      return (
                        <label
                          key={day}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none ${
                            isActive
                              ? 'bg-indigo-50/90 border-indigo-300 text-indigo-700 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name={`day_${day}`}
                            checked={isActive}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span>{day}</span>
                          <span className={`text-[9px] mt-1 font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {isActive ? 'Work' : 'Off'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Weekly Off Day
                    </label>
                    <select
                      name="weeklyOff"
                      value={form.weeklyOff}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white font-medium"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Saturday & Sunday">Saturday & Sunday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Friday">Friday</option>
                      <option value="None">None (Rotational Off)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Effective Date From
                    </label>
                    <input
                      type="date"
                      name="effectiveFrom"
                      value={form.effectiveFrom}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Attendance & Present Rules */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-emerald-50/20 px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                  <ClipboardCheck size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Attendance Rules</h2>
                  <p className="text-[11px] text-slate-400">Half day and full day minimum thresholds</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Half-Day Threshold
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      name="halfDayAfter"
                      value={form.halfDayAfter}
                      onChange={handleChange}
                      min={1}
                      max={12}
                      className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-500">Hours worked</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Working less than this is marked as Absent / Half Day.</p>
                </div>

                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full-Day Minimum Hours
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      name="minimumHours"
                      value={form.minimumHours}
                      onChange={handleChange}
                      min={1}
                      max={24}
                      className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs font-semibold text-slate-500">Hours required</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Required minimum time to count a full-day present.</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Timings & Break Management */}
          <div className="lg:col-span-5 space-y-6">

            {/* 4. Shift Timings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-emerald-50/20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Shift Timings</h2>
                    <p className="text-[11px] text-slate-400">Start & end clock, grace & overtime</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Clock In / Out */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Auto Calculated Hours Pill */}
                <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold">Total Shift Duration:</span>
                  </div>
                  <span className="text-sm font-extrabold font-mono bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                    {form.workingHours} Hrs
                  </span>
                </div>

                {/* Grace & Late Mark */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Grace Time
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="graceTime"
                        value={form.graceTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">min</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Late Mark After
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="lateMarkAfter"
                        value={form.lateMarkAfter}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">min</span>
                    </div>
                  </div>
                </div>

                {/* Early Leaving & Overtime */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Early Leaving
                    </label>
                    <select
                      name="earlyLeaving"
                      value={form.earlyLeaving}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="No">Disallowed</option>
                      <option value="Yes">Allowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Overtime (OT)
                    </label>
                    <select
                      name="overtime"
                      value={form.overtime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="Yes">Allowed</option>
                      <option value="No">No OT</option>
                    </select>
                  </div>
                </div>

                {form.overtime === 'Yes' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      OT Calculation Starts After
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="otAfter"
                        value={form.otAfter}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">min</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Breaks Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-amber-50/20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Break Slots</h2>
                    <p className="text-[11px] text-slate-400">Lunch & rest intervals</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-600 cursor-pointer">
                    Enable
                  </label>
                  <input
                    type="checkbox"
                    checked={form.breakApplicable === 'Yes'}
                    onChange={(e) => setForm(p => ({ ...p, breakApplicable: e.target.checked ? 'Yes' : 'No' }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>
              </div>

              {form.breakApplicable === 'Yes' && (
                <div className="p-5 space-y-3">
                  {breaks.map((b, idx) => (
                    <div key={b.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          Break #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBreak(b.id)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) => handleBreakChange(b.id, 'name', e.target.value)}
                          placeholder="e.g. Lunch"
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                        <input
                          type="time"
                          value={b.start}
                          onChange={(e) => handleBreakChange(b.id, 'start', e.target.value)}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                        <input
                          type="time"
                          value={b.end}
                          onChange={(e) => handleBreakChange(b.id, 'end', e.target.value)}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddBreak}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Add Another Break Slot
                  </button>
                </div>
              )}
            </div>

            {/* 6. General Settings (Default & Night Shift) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-purple-50/20 px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                  <Moon size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Flags & Defaults</h2>
                  <p className="text-[11px] text-slate-400">Night shift & auto-assignment</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Default Shift</span>
                    <span className="text-[10px] text-slate-400">Auto-assign to new joining employees</span>
                  </div>
                  <select
                    name="defaultShift"
                    value={form.defaultShift}
                    onChange={handleChange}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Night Shift</span>
                    <span className="text-[10px] text-slate-400">Shift ends next calendar day (past midnight)</span>
                  </div>
                  <select
                    name="nightShift"
                    value={form.nightShift}
                    onChange={handleChange}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Floating-style Action Bar */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate('/hrms/setup/shifts')}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-200 active:scale-95 transition flex items-center gap-1.5"
            >
              <CheckCircle size={15} /> {isEditMode ? 'Update Shift Configuration' : 'Create & Save Shift'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddShiftSetup;
