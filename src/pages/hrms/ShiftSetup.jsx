import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit, Clock, Calendar, Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ShiftSetup = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await api.get('/shift-setups');
      if (response.data && response.data.data) {
        setShifts(response.data.data);
      } else if (response.data && response.data.shifts) {
        setShifts(response.data.shifts);
      } else if (Array.isArray(response.data)) {
        setShifts(response.data);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift configuration?")) {
      try {
        await api.delete(`/shift-setups/${id}`);
        setShifts(shifts.filter(s => s._id !== id));
        alert('Shift deleted successfully');
      } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Failed to delete shift');
      }
    }
  };

  const stats = {
    total: shifts.length,
    defaultWeeklyOff: 'Sunday',
    maxGrace: shifts.length > 0 ? Math.max(...shifts.map(s => Number(s.graceTime) || 0)) : 0,
    avgHours: shifts.length > 0 ? (shifts.reduce((acc, s) => acc + (parseFloat(s.workingHours?.replace(':','.')) || 8), 0) / shifts.length).toFixed(1) : 0
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
                <tr key={s._id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{s.shiftCode}</td>
                  <td className="p-3 text-slate-800 font-bold">{s.shiftName}</td>
                  <td className="p-3 text-indigo-600 font-mono font-bold">{s.startTime}</td>
                  <td className="p-3 text-slate-600 font-mono font-bold">{s.endTime}</td>
                  <td className="p-3 text-center font-semibold text-amber-600">{s.graceTime} Min(s)</td>
                  <td className="p-3 text-gray-650 font-semibold">{s.weeklyOff}</td>
                  <td className="p-3 text-center font-bold text-slate-850">{s.workingHours} Hrs</td>
                  <td className="p-3 text-right no-print flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/hrms/setup/shifts/edit/${s._id}`)}
                      className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s._id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-600 transition"
                      title="Delete"
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

    </div>
  );
};

export default ShiftSetup;
