import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Clock, CalendarDays, ClipboardCheck, Settings, Users, Moon, Plus, Trash2 } from 'lucide-react';
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

  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({ name: '' });

  const [shiftTypes, setShiftTypes] = useState(['Fixed', 'Flexible', 'Rotating']);
  const [companies, setCompanies] = useState(['Acme Corp']);
  const [branches, setBranches] = useState(['HQ - Mumbai']);
  const [departments, setDepartments] = useState(['IT & Systems', 'HR']);
  const [statuses, setStatuses] = useState(['Active', 'Inactive']);
  const [earlyLeavings, setEarlyLeavings] = useState(['No', 'Yes']);
  const [overtimes, setOvertimes] = useState(['Yes', 'No']);
  const [breakApplicables, setBreakApplicables] = useState(['Yes', 'No']);
  const [breakTypes, setBreakTypes] = useState(['Fixed', 'Flexible']);
  const [weeklyOffs, setWeeklyOffs] = useState(['Sunday', 'Saturday & Sunday']);
  const [attendanceRequireds, setAttendanceRequireds] = useState(['Yes', 'No']);
  const [lateComings, setLateComings] = useState(['Allowed', 'Not Allowed']);
  const [attendanceMethods, setAttendanceMethods] = useState(['Biometric', 'Web Check-in', 'Mobile App']);
  const [autoCheckouts, setAutoCheckouts] = useState(['No', 'Yes']);
  const [assignTos, setAssignTos] = useState(['Department', 'Employee']);
  const [employees, setEmployees] = useState(['All Staff']);
  const [defaultShifts, setDefaultShifts] = useState(['No', 'Yes']);
  const [nightShifts, setNightShifts] = useState(['No', 'Yes']);
  const [crossMidnights, setCrossMidnights] = useState(['No', 'Yes']);
  const [nextDayCheckouts, setNextDayCheckouts] = useState(['Auto', 'Manual']);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!modalData.name) return;
    
    if (modalType === 'Shift Type') setShiftTypes([...shiftTypes, modalData.name]);
    if (modalType === 'Company') setCompanies([...companies, modalData.name]);
    if (modalType === 'Branch') setBranches([...branches, modalData.name]);
    if (modalType === 'Department') setDepartments([...departments, modalData.name]);
    if (modalType === 'Status') setStatuses([...statuses, modalData.name]);
    if (modalType === 'Early Leaving') setEarlyLeavings([...earlyLeavings, modalData.name]);
    if (modalType === 'Overtime') setOvertimes([...overtimes, modalData.name]);
    if (modalType === 'Break Applicable') setBreakApplicables([...breakApplicables, modalData.name]);
    if (modalType === 'Break Type') setBreakTypes([...breakTypes, modalData.name]);
    if (modalType === 'Weekly Off') setWeeklyOffs([...weeklyOffs, modalData.name]);
    if (modalType === 'Attendance Required') setAttendanceRequireds([...attendanceRequireds, modalData.name]);
    if (modalType === 'Late Coming') setLateComings([...lateComings, modalData.name]);
    if (modalType === 'Attendance Method') setAttendanceMethods([...attendanceMethods, modalData.name]);
    if (modalType === 'Auto Checkout') setAutoCheckouts([...autoCheckouts, modalData.name]);
    if (modalType === 'Assign To') setAssignTos([...assignTos, modalData.name]);
    if (modalType === 'Employee / Dept') setEmployees([...employees, modalData.name]);
    if (modalType === 'Default Shift') setDefaultShifts([...defaultShifts, modalData.name]);
    if (modalType === 'Night Shift') setNightShifts([...nightShifts, modalData.name]);
    if (modalType === 'Cross Midnight') setCrossMidnights([...crossMidnights, modalData.name]);
    if (modalType === 'Next Day Checkout') setNextDayCheckouts([...nextDayCheckouts, modalData.name]);

    const tempType = modalType;
    setModalType(null);
    setModalData({ name: '' });
    alert(`${tempType} added successfully!`);
  };

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

  useEffect(() => {
    if (isEditMode) {
      fetchShiftDetails();
    }
  }, [id]);

  const fetchShiftDetails = async () => {
    try {
      const response = await api.get(`/shift-setups/${id}`);
      const shiftData = response.data.data || response.data;
      if (shiftData) {
        setForm({
          shiftCode: shiftData.shiftCode || '',
          shiftName: shiftData.shiftName || '',
          shiftType: shiftData.shiftType || 'Fixed',
          company: shiftData.company || '',
          branch: shiftData.branch || '',
          department: shiftData.department || '',
          status: shiftData.status || 'Active',
          startTime: shiftData.startTime || '09:00',
          endTime: shiftData.endTime || '18:00',
          workingHours: shiftData.workingHours || '08:30',
          graceTime: shiftData.graceTime || '15',
          lateMarkAfter: shiftData.lateMarkAfter || '15',
          earlyLeaving: shiftData.earlyLeaving || 'No',
          overtime: shiftData.overtime || 'Yes',
          otAfter: shiftData.otAfter || '30',
          breakApplicable: shiftData.breakApplicable || 'Yes',
          breakType: shiftData.breakType || 'Fixed',
          breakDuration: shiftData.breakDuration || '30',
          paidBreak: shiftData.paidBreak || 'Yes',
          workDays: shiftData.workDays || { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
          weeklyOff: shiftData.weeklyOff || 'Sunday',
          attendanceRequired: shiftData.attendanceRequired || 'Yes',
          lateComing: shiftData.lateComing || 'Allowed',
          halfDayAfter: shiftData.halfDayAfter || '4',
          minimumHours: shiftData.minimumHours || '8',
          attendanceMethod: shiftData.attendanceMethod || 'Biometric',
          autoCheckout: shiftData.autoCheckout || 'No',
          assignTo: shiftData.assignTo || 'Department',
          employee: shiftData.employee || '',
          effectiveFrom: shiftData.effectiveFrom || '',
          effectiveTo: shiftData.effectiveTo || '',
          defaultShift: shiftData.defaultShift || 'No',
          nightShift: shiftData.nightShift || 'No',
          crossMidnight: shiftData.crossMidnight || 'No',
          nextDayCheckout: shiftData.nextDayCheckout || 'Auto'
        });
        if (shiftData.breaks && shiftData.breaks.length > 0) {
          setBreaks(shiftData.breaks.map(b => ({ ...b, id: b._id || Date.now() + Math.random() })));
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/setup/shifts')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Shift List
        </button>
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
                  <input type="text" name="shiftCode" value={form.shiftCode} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Shift Name *</label>
                  <input type="text" name="shiftName" value={form.shiftName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. General Shift" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Shift Type *</label>
                    <button type="button" onClick={() => setModalType('Shift Type')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="shiftType" value={form.shiftType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {shiftTypes.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Company *</label>
                    <button type="button" onClick={() => setModalType('Company')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="company" value={form.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    {companies.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Branch</label>
                    <button type="button" onClick={() => setModalType('Branch')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Department</label>
                    <button type="button" onClick={() => setModalType('Department')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    {departments.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Status *</label>
                    <button type="button" onClick={() => setModalType('Status')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-emerald-600 font-bold">
                    {statuses.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Weekly Off</label>
                    <button type="button" onClick={() => setModalType('Weekly Off')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="weeklyOff" value={form.weeklyOff} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {weeklyOffs.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Attendance Required</label>
                    <button type="button" onClick={() => setModalType('Attendance Required')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="attendanceRequired" value={form.attendanceRequired} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {attendanceRequireds.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Late Coming</label>
                    <button type="button" onClick={() => setModalType('Late Coming')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="lateComing" value={form.lateComing} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {lateComings.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Attendance Method</label>
                    <button type="button" onClick={() => setModalType('Attendance Method')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="attendanceMethod" value={form.attendanceMethod} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {attendanceMethods.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Auto Checkout</label>
                    <button type="button" onClick={() => setModalType('Auto Checkout')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="autoCheckout" value={form.autoCheckout} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {autoCheckouts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. SHIFT TIMING */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} className="text-emerald-500" /> Shift Timing
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Start Time *</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">End Time *</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Working Hours (Auto)</label>
                  <input type="text" value={`${form.workingHours} Hrs`} disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-emerald-600 font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Grace Time</label>
                    <div className="flex items-center gap-2">
                      <input type="number" name="graceTime" value={form.graceTime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none" />
                      <span className="text-xs text-slate-500">Min</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Late Mark After</label>
                    <div className="flex items-center gap-2">
                      <input type="number" name="lateMarkAfter" value={form.lateMarkAfter} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none" />
                      <span className="text-xs text-slate-500">Min</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Early Leaving</label>
                      <button type="button" onClick={() => setModalType('Early Leaving')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="earlyLeaving" value={form.earlyLeaving} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none">
                      {earlyLeavings.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Overtime</label>
                      <button type="button" onClick={() => setModalType('Overtime')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="overtime" value={form.overtime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none">
                      {overtimes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                {form.overtime === 'Yes' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">OT After (Min)</label>
                    <input type="number" name="otAfter" value={form.otAfter} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-400 outline-none" />
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Break Applicable</label>
                      <button type="button" onClick={() => setModalType('Break Applicable')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="breakApplicable" value={form.breakApplicable} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none">
                      {breakApplicables.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase">Break Type</label>
                      <button type="button" onClick={() => setModalType('Break Type')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                    </div>
                    <select name="breakType" value={form.breakType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none">
                      {breakTypes.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Assign To</label>
                    <button type="button" onClick={() => setModalType('Assign To')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="assignTo" value={form.assignTo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {assignTos.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Employee / Dept</label>
                    <button type="button" onClick={() => setModalType('Employee / Dept')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="employee" value={form.employee} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Target...</option>
                    {employees.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Default Shift</label>
                    <button type="button" onClick={() => setModalType('Default Shift')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="defaultShift" value={form.defaultShift} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {defaultShifts.map(o => <option key={o} value={o}>{o}</option>)}
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Night Shift</label>
                    <button type="button" onClick={() => setModalType('Night Shift')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="nightShift" value={form.nightShift} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {nightShifts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Cross Midnight</label>
                    <button type="button" onClick={() => setModalType('Cross Midnight')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="crossMidnight" value={form.crossMidnight} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {crossMidnights.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase">Next Day Checkout</label>
                    <button type="button" onClick={() => setModalType('Next Day Checkout')} className="text-indigo-600 hover:text-indigo-800"><Plus size={14} /></button>
                  </div>
                  <select name="nextDayCheckout" value={form.nextDayCheckout} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    {nextDayCheckouts.map(o => <option key={o} value={o}>{o}</option>)}
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
              <CheckCircle size={16} /> {isEditMode ? 'Update Shift' : 'Create Shift'}
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

export default AddShiftSetup;
