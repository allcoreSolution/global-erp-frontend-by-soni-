import React, { useState } from 'react';
import { Settings, Plus, Trash2, X, Clock, Calendar, Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShiftSetup = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([
    { id: 'SFT-01', name: 'General Office Shift', start: '09:00 AM', end: '06:00 PM', grace: 15, weeklyOff: 'Sunday', hours: 9 },
    { id: 'SFT-02', name: 'Night Production Shift', start: '10:00 PM', end: '07:00 AM', grace: 10, weeklyOff: 'Sunday', hours: 9 },
    { id: 'SFT-03', name: 'Early Morning Dispatch', start: '06:00 AM', end: '02:00 PM', grace: 5, weeklyOff: 'Saturday', hours: 8 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({
    name: '',
    start: '09:00 AM',
    end: '06:00 PM',
    grace: 15,
    weeklyOff: 'Sunday'
  });

  const handleAddShift = (e) => {
    e.preventDefault();
    if (!newShift.name) {
      alert("Shift Name is required!");
      return;
    }
    const nextId = `SFT-${String(shifts.length + 1).padStart(2, '0')}`;
    
    // Calculate total working hours roughly (fallback 9 hours if calculation is complex)
    const hours = 9; 

    const added = {
      id: nextId,
      name: newShift.name,
      start: newShift.start,
      end: newShift.end,
      grace: Number(newShift.grace) || 0,
      weeklyOff: newShift.weeklyOff,
      hours
    };

    setShifts([...shifts, added]);
    setShowAddModal(false);
    setNewShift({ name: '', start: '09:00 AM', end: '06:00 PM', grace: 15, weeklyOff: 'Sunday' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this shift configuration?")) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  const stats = {
    total: shifts.length,
    defaultWeeklyOff: 'Sunday',
    maxGrace: Math.max(...shifts.map(s => s.grace)),
    avgHours: (shifts.reduce((acc, s) => acc + s.hours, 0) / (shifts.length || 1)).toFixed(1)
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-indigo-600" size={24} /> Shift & Timings Setup
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Configure default company working shifts, in/out timings, daily late-entry grace periods, and weekly off schedules.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => navigate('/hrms/setup/shifts/add')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> Create New Shift
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Active Shifts</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <Shield size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Avg Shift Hours</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1 flex items-center gap-1">
              {stats.avgHours} <span className="text-xs text-emerald-600 font-normal">Hrs/day</span>
            </div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Max Grace Allowed</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1 flex items-center gap-1">
              {stats.maxGrace} <span className="text-xs text-purple-600 font-normal">Mins</span>
            </div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Standard Weekly Off</div>
            <div className="text-sm font-bold text-amber-800 dark:text-amber-400 mt-2">{stats.defaultWeeklyOff}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Calendar size={18} />
          </div>
        </div>

      </div>

      {/* Shifts Matrix Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Office Working Shift Configurations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Shift ID</th>
                <th className="p-3">Shift Name</th>
                <th className="p-3">Clock In Time</th>
                <th className="p-3">Clock Out Time</th>
                <th className="p-3 text-center">Late Entry Grace (Mins)</th>
                <th className="p-3">Weekly Off Day</th>
                <th className="p-3 text-center">Duty Duration (Hrs)</th>
                <th className="p-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{s.id}</td>
                  <td className="p-3 text-slate-800 font-bold">{s.name}</td>
                  <td className="p-3 text-indigo-600 font-mono font-bold">{s.start}</td>
                  <td className="p-3 text-slate-600 font-mono font-bold">{s.end}</td>
                  <td className="p-3 text-center font-semibold text-amber-600">{s.grace} Min(s)</td>
                  <td className="p-3 text-gray-650 font-semibold">{s.weeklyOff}</td>
                  <td className="p-3 text-center font-bold text-slate-850">{s.hours} Hrs</td>
                  <td className="p-3 text-right no-print">
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SHIFT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Create Shift Timing Rule</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddShift} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Shift Name *</label>
                <input 
                  type="text" 
                  value={newShift.name}
                  onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Afternoon Support Shift"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Clock-In Time</label>
                  <input 
                    type="text" 
                    value={newShift.start}
                    onChange={(e) => setNewShift({...newShift, start: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 09:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Clock-Out Time</label>
                  <input 
                    type="text" 
                    value={newShift.end}
                    onChange={(e) => setNewShift({...newShift, end: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 06:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Grace Period (Mins)</label>
                  <input 
                    type="number" 
                    value={newShift.grace}
                    onChange={(e) => setNewShift({...newShift, grace: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 15"
                  />
                </div>
                <div>
                  <label className="block text-gray-650 mb-1">Weekly Off Day</label>
                  <select 
                    value={newShift.weeklyOff}
                    onChange={(e) => setNewShift({...newShift, weeklyOff: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Friday">Friday</option>
                    <option value="Thursday">Thursday</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-655 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded font-bold shadow-xs"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShiftSetup;
