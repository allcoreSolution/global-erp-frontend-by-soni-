import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, UserX, Clock, Check, RefreshCw, Printer, Download } from 'lucide-react';
import api from '../../api';

const DailyAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both active employees and attendance for the selected date
      const [empRes, attRes] = await Promise.all([
        api.get('/employees'),
        api.get(`/attendances?date=${selectedDate}`)
      ]);

      const activeEmployees = empRes.data?.data?.filter(e => e.status !== 'Inactive') || [];
      const attendanceRecords = attRes.data?.data || [];

      // Merge them
      const merged = activeEmployees.map(emp => {
        const record = attendanceRecords.find(a => a.employee && (a.employee._id === emp._id || a.employee === emp._id));
        return {
          id: emp._id, // use actual ID for API calls
          displayId: emp.employeeId || 'N/A',
          name: emp.employeeName || 'Unknown',
          role: emp.designation || 'Staff',
          shift: emp.shift || 'General Shift',
          checkIn: record ? record.checkIn : '--',
          checkOut: record ? record.checkOut : '--',
          status: record ? record.status : 'Absent', // default Absent if no record
        };
      });

      setAttendance(merged);
    } catch (error) {
      console.error('Failed to fetch attendance data', error);
      alert('Failed to fetch attendance data: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length
  };

  const handleStatusChange = async (id, newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      let checkIn = '--';
      let checkOut = '--';

      if (newStatus === 'Present') {
        checkIn = '09:00 AM';
        checkOut = '06:00 PM';
      } else if (newStatus === 'Late') {
        checkIn = '09:30 AM';
        checkOut = '06:00 PM';
      }

      await api.post('/attendances', {
        employeeId: id,
        date: selectedDate,
        status: newStatus,
        checkIn,
        checkOut
      });

      // Update locally
      setAttendance(prev => prev.map(emp => {
        if (emp.id === id) {
          return { ...emp, status: newStatus, checkIn, checkOut };
        }
        return emp;
      }));

    } catch (error) {
      console.error('Failed to mark attendance', error);
      alert('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllPresent = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const recordsToUpdate = attendance.map(emp => ({
        employeeId: emp.id,
        date: selectedDate,
        status: 'Present',
        checkIn: '09:00 AM',
        checkOut: '06:00 PM'
      }));

      await api.post('/attendances/bulk', { records: recordsToUpdate });

      // Update locally
      setAttendance(prev => prev.map(emp => ({
        ...emp,
        status: 'Present',
        checkIn: '09:00 AM',
        checkOut: '06:00 PM'
      })));
      alert('All employees marked as present for ' + selectedDate);
    } catch (error) {
      console.error('Failed to bulk mark attendance', error);
      alert('Failed to mark all as present: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Role', 'Clock In', 'Clock Out', 'Status', 'Shift'];
    const rows = attendance.map(a => [a.displayId, a.name, a.role, a.checkIn, a.checkOut, a.status, a.shift]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Log_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={24} /> Daily Attendance Register
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Log employee clock-in/out times, approve attendance codes, and download log sheets.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 no-print">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded-lg transition"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Strength</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <button onClick={fetchData} className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg hover:bg-blue-200 transition-colors">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Present Today</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">{stats.present}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase">Absent Today</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-400 mt-1">{stats.absent}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <UserX size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Late Entries</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">{stats.late}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

      </div>

      {/* Attendance Log Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Daily Roster Sheets: {selectedDate}</h3>
          <button 
            onClick={handleMarkAllPresent}
            disabled={isUpdating || attendance.length === 0}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 text-white font-bold text-[10px] rounded shadow-xs transition no-print disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Mark All Present'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">Shift Details</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
                <th className="p-3">Attendance Status</th>
                <th className="p-3 text-right no-print">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                 <tr><td colSpan="8" className="p-4 text-center text-gray-500">Loading attendance data...</td></tr>
              ) : attendance.length === 0 ? (
                 <tr><td colSpan="8" className="p-4 text-center text-gray-500">No active employees found.</td></tr>
              ) : (
                attendance.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/30">
                    <td className="p-3 font-semibold text-gray-800">{emp.displayId}</td>
                    <td className="p-3 text-slate-800 font-medium">{emp.name}</td>
                    <td className="p-3 text-gray-500">{emp.role}</td>
                    <td className="p-3 text-gray-600">{emp.shift}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{emp.checkIn}</td>
                    <td className="p-3 font-mono font-bold text-slate-600">{emp.checkOut}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        emp.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1 no-print">
                      <button 
                        onClick={() => handleStatusChange(emp.id, 'Present')}
                        disabled={isUpdating}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition border disabled:opacity-50 ${
                          emp.status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                        }`}
                      >
                        P
                      </button>
                      <button 
                        onClick={() => handleStatusChange(emp.id, 'Late')}
                        disabled={isUpdating}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition border disabled:opacity-50 ${
                          emp.status === 'Late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                        }`}
                      >
                        L
                      </button>
                      <button 
                        onClick={() => handleStatusChange(emp.id, 'Absent')}
                        disabled={isUpdating}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition border disabled:opacity-50 ${
                          emp.status === 'Absent' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                        }`}
                      >
                        A
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;
